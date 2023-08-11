# Redmine Paste as Wiki Tables
This plugin enhances the functionalities of Redmine by handling **paste** events for tables and clipboard images.

Many thanks to the original authors `suer` and `knt419` for the excellent work.

## Features
* **Table Format Pasting:** This plugin allows you to directly paste text from Excel (or any tab-separated text with carriage returns) onto your clipboard as Wiki-style table format. It intelligently formats your clipboard data to ensure seamless integration within your Wiki tables.
* **Image Addition to Issue Notes:** In addition to the existing feature of adding images to new issue notes, this plugin enables you to include images even while editing existing issue notes. Importantly, this operation triggers a save function ensuring that your newly added attachments are saved correctly.

## Author
* suer (2017)
* knt419 (2018)
* Jan Catrysse (2023)

## Install
Type below commands:
* $ cd $RAILS_ROOT/plugins
* $ git clone https://github.com/jcatrysse/redmine_paste_as_wiki_tables.git
* $ `bundle exec rake redmine:plugins:migrate NAME=redmine_paste_as_wiki_tables RAILS_ENV=production`

Clipboard options can be modified in the Plugin Settings

Then, restart your Redmine.

## Requirements
* Redmine 2.6 or later (tested until version 0.0.1)
* Redmine 4.x
* Redmine 5.x

## License
The MIT License (MIT)
Copyright (c) 2017 suer
Copyright (c) 2018 knt419
Copyright (c) 2023 Jan Catrysse
