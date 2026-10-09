# O3P Widgets

Odoo 20 addon providing shared O3P web widgets and their common settings.

The **O3P Widgets** area in General Settings includes a **Minimum text lines**
option. It defaults to Odoo's native `2` lines when the addon is first installed.
Other positive values adjust text fields in 25-pixel increments; explicit `rows`
attributes are preserved. Setting changes apply after a browser refresh.

The same settings area includes **Minimum list lines**, defaulting to Odoo's
native `4`. It controls the minimum row count in list and embedded one-to-many
views; an available **Add a line** row counts toward the configured total. A
value of `0` removes filler rows. The native renderer remains unpatched at `4`.

Notebook tabs are remembered locally for each browser, URL, and notebook position.
When a page is reopened, each notebook restores its most recently selected visible
tab. Saved entries expire automatically after 48 hours. Storage failures never
block the interface and are reported only as browser console warnings. The feature
can be disabled with **Remember notebook tabs** in the O3P Widgets settings area.

## Deployment

- `./restart_odoo20.sh` deploys the current repository and restarts Odoo.
- `./upush.sh "commit message"` commits and pushes, with an optional restart.
- `./fulldeploy.sh "commit message"` commits, pushes, deploys, and installs or
  upgrades `o3p_widgets` on the configured database.

Deployment settings can be overridden with the environment variables declared
at the top of each script.
