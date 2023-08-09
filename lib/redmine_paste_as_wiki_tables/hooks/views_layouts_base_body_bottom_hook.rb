module RedminePasteAsWikiTables
  module Hooks
    class ViewsLayoutsBaseBodyBottomHook < Redmine::Hook::ViewListener
      render_on :view_layouts_base_body_bottom, partial: 'redmine_paste_as_wiki_tables/script'
    end
  end
end
