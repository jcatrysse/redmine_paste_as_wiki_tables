require File.expand_path('../test_helper', __dir__)

class ScriptTest < Redmine::IntegrationTest
  fixtures :projects, :users, :email_addresses, :roles, :members, :member_roles,
           :trackers, :projects_trackers, :enabled_modules, :issue_statuses,
           :enumerations, :issues, :journals

  def setup
    Setting.plugin_redmine_paste_as_wiki_tables = {}
    Setting.clear_cache
  end

  def teardown
    Setting.plugin_redmine_paste_as_wiki_tables = {}
    Setting.clear_cache
  end

  def flag(name)
    response.body[/const #{name} = (true|false);/, 1]
  end

  test 'script is rendered with every feature on while the settings were never saved' do
    # the plugin's defaults are booleans, not '1'
    Setting.where(name: 'plugin_redmine_paste_as_wiki_tables').delete_all
    Setting.clear_cache
    log_user('jsmith', 'jsmith')
    get '/issues/1'
    assert_response :success
    assert_equal 'true', flag('enableTablePaste')
    assert_equal 'true', flag('enableImagePaste')
    assert_equal 'true', flag('enableAutoSubmit')
  end

  test 'script follows the saved settings' do
    Setting.plugin_redmine_paste_as_wiki_tables = {'enable_table_paste' => '0', 'enable_image_paste' => '1',
                                                   'enable_auto_submit' => '0'}
    log_user('jsmith', 'jsmith')
    get '/issues/1'
    assert_equal 'false', flag('enableTablePaste')
    assert_equal 'true', flag('enableImagePaste')
    assert_equal 'false', flag('enableAutoSubmit')
  end

  test 'messages are emitted as JSON strings' do
    I18n.backend.send(:init_translations) # load the files first, or they overwrite the stored ones
    I18n.backend.store_translations(:en, messages: {save_issue: %q(say "hi" </script> it's)})
    log_user('jsmith', 'jsmith')
    get '/issues/1'
    assert_includes response.body, %q(const messageSaveIssue = "say \"hi\" \u003c/script\u003e it's";)
  ensure
    I18n.reload!
  end

  test 'text formatting is emitted as a JSON string' do
    with_settings text_formatting: 'common_mark' do
      log_user('jsmith', 'jsmith')
      get '/issues/1'
      assert_includes response.body, 'const textFormatting = "common_mark";'
    end
  end

  test 'settings form shows the defaults as checked while the settings were never saved' do
    Setting.where(name: 'plugin_redmine_paste_as_wiki_tables').delete_all
    Setting.clear_cache
    log_user('admin', 'admin')
    get '/settings/plugin/redmine_paste_as_wiki_tables'
    %w[enable_table_paste enable_image_paste enable_auto_submit].each do |key|
      assert_select "input[type=hidden][name='settings[#{key}]'][value='0']"
      assert_select "input[type=checkbox][name='settings[#{key}]'][checked]"
    end
  end

  test 'settings form posts a 0 for every unchecked box' do
    log_user('admin', 'admin')
    get '/settings/plugin/redmine_paste_as_wiki_tables'
    assert_response :success
    %w[enable_table_paste enable_image_paste enable_auto_submit].each do |key|
      assert_select "input[type=hidden][name='settings[#{key}]'][value='0']"
      assert_select "input[type=checkbox][name='settings[#{key}]']:not([checked])"
    end
  end

  test 'settings saved with every box unchecked switch the features off' do
    log_user('admin', 'admin')
    post '/settings/plugin/redmine_paste_as_wiki_tables',
         params: {settings: {enable_table_paste: '0', enable_image_paste: '0', enable_auto_submit: '0'}}
    assert_redirected_to '/settings/plugin/redmine_paste_as_wiki_tables'
    get '/settings/plugin/redmine_paste_as_wiki_tables'
    assert_select 'input[type=checkbox][checked]', 0
    get '/issues/1'
    assert_equal 'false', flag('enableTablePaste')
  end
end
