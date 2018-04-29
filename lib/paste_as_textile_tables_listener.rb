class PasteAsTextileTablesListener < Redmine::Hook::ViewListener
  render_on :view_layouts_base_html_head,
            partial: 'paste_as_textile_tables/script'
end
