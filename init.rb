require File.expand_path('../lib/paste_as_wiki_tables_listener', __FILE__)

Redmine::Plugin.register :redmine_paste_as_wiki_tables do
  name 'Redmine Paste As Wiki Tables plugin'
  author 'knt419'
  description 'Paste as wiki-style tables from Excel format text'
  version '0.0.2'
  url 'https://github.com/knt419/redmine_paste_as_wiki_tables'
  author_url 'https://github.com/knt419/'
end
