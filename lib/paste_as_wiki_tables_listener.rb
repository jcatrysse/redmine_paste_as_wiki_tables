class PasteAsWikiTablesListener < Redmine::Hook::ViewListener
  render_on :view_layouts_base_body_bottom,
            partial: 'paste_as_wiki_tables/script'
end
