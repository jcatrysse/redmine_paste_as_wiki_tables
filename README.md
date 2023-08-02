# Redmine Paste as Wiki Tables
This plugin enhances the functionalities of Redmine by handling **paste** events for tables and clipboard images.

Many thanks to the original authors `suer` and `knt419` for the excellent work.

## Features
* **Table Format Pasting:** This plugin allows you to directly paste text from Excel (or any tab-separated text with carriage returns) onto your clipboard as Wiki-style table format. It intelligently formats your clipboard data to ensure seamless integration within your Wiki tables.
* **Image Addition to Issue Notes:** In addition to the existing feature of adding images to new issue notes, this plugin enables you to include images even while editing existing issue notes. Importantly, this operation triggers a save function ensuring that your newly added attachments are saved correctly.

# Author
* suer (2017)
* knt419 (2018)
* Jan Catrysse (2023)

# Install
Type below commands:
* $ cd $RAILS_ROOT/plugins
* $ git clone https://github.com/jcatrysse/redmine_paste_as_wiki_tables.git

Clipboard options can be modified in the Plugin Settings

Then, restart your Redmine.

# Requirements
* Redmine 2.6 or later (tested until version 0.0.1)
* Redmine 4.x
* Redmine 5.x

# License
The MIT License (MIT)
Copyright (c) 2017 suer
Copyright (c) 2018 knt419
Copyright (c) 2023 Jan Catrysse

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
