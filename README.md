Projector was born out of two needs:
1. Needing a project to use for learning Claude Code
2. Trying to keep track of the increasing number of things I was dropping the ball on.

The app, at present, has a place to put
* Personal Tasks
* Reading list (articles, documents, videos)
* One or more projects, each with
  * Description, funded flag, create date
  * Tasks
  * List of people with roles
  * Notes with optional links (I use it to keep track of all the loops, murals, confluence pages, etc. every project seems to have)

Other features
* There is an overview page that shows all your currently open tasks.
* Tasks can have a due date. Try typing +n to set a due date n business days out. You can also just type in a date
* You can use markdown syntax on links in the Tasks and reading lists to give a friendlier label rather than just showing the raw url
* On a project page, if you aren't in an input field, you can type 't' to quickly add a task, 'p' to quickly add a person, or 'n' to quickly add a note
* There is a year end report you can get to see everything you did last year for your review (which year is configurable)
* Projects can be paused and you can specify a time (global setting, not specific to a project) to be reminded to verify if that project is still alive
* People field and role field have auto-complete. In settings, you can suppress names that you don't want to be shown any more.
* The reading list supports a description, a link, who recommended it (with autocomplete), and tags (with autocomplete).
* You can export and import the data in the database. There is also an auto-backup feature but it uses the file system API and there are restrictions in place that make it kind of a pain to use as permissions need to be granted every time you load.

Other things I might add
* Little broken bits of the UI that Claude struggles to get right
* Making sure Claude actually followed the UDF development pattern it's supposed to be using.
* Searching the reading list
* Dealing with displaying items in the reading list you've read so you don't lose them but they don't clog up the UI
* Actually doing something useful with the tags on reading list items
* No idea, I'll see as I use it what doesn't work or is missing
