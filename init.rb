Redmine::Plugin.register :redmine_paste_as_wiki_tables do
  name 'Redmine Paste As Wiki Tables plugin'
  author 'Jan Catrysse'
  description 'This plugin enhances the functionalities of Redmine by handling **paste** events for tables and clipboard images.'
  version '0.0.2'
  url 'https://github.com/jcatrysse/redmine_paste_as_wiki_tables'
  author_url 'https://github.com/jcatrysse/'

  require File.dirname(__FILE__) + '/lib/paste_as_wiki_tables_listener'

  settings default: {'enable_table_paste' => true, 'enable_image_paste' => true, 'enable_auto_submit' => true},
           partial: 'settings/paste_as_wiki_tables_settings'
end
