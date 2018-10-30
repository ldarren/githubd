set nocompatible                " choose no compatibility with legacy vi                                                                                                                                    
set encoding=utf-8
" filetype plugin indent on       " load file type plugins + indentation

" Visual
syntax enable
filetype on
set background=dark
" set number      " show numbers
set cursorline  " highlight line of the cursor
set showcmd     " show partial commands below the status line
set scrolloff=3 " have some context around the current line always on screen
" set wrap        " Enable wrapping of text
set linebreak   " Only wrap character on break option
set showmatch   " highlight matching braces

" Folding
set foldenable          " enable folding
set foldmethod=indent   " fold based on indent level
set foldlevelstart=10   " open most folds by default
set foldnestmax=10      " 10 nested fold max

" Whitespace
set tabstop=4 shiftwidth=4      " a tab is four spaces (or set this to 2)
" set expandtab                   " use spaces, not tabs (optional)
set backspace=indent,eol,start  " backspace through everything in insert mode

" Searching
set hlsearch                       " highlight matches
set incsearch                      " incremental searching
set smartcase                      " ... unless they contain at least one capital letter
set autoindent

" Allow backgrounding buffers without writing them, and remember marks/undo
" for backgrounded buffers
set hidden

" Auto-reload buffers when file changed on disk
set autoread

" Disable swap files; systems don't crash that often these days
set updatecount=0
