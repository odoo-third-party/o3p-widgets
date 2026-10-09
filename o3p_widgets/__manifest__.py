{
    "name": "o3p - widgets",
    "summary": "Shared web widgets for Odoo.",
    "version": "20.0.1.2.0",
    "category": "Technical",
    "author": "O3P",
    "website": "https://github.com/odoo-third-party/o3p-widgets",
    "license": "LGPL-3",
    "depends": ["base_setup", "web"],
    "sequence": 1,
    "data": [
        "security/ir.access.csv",
        "data/config_parameter_data.xml",
        "views/res_config_settings_views.xml",
    ],
    "assets": {
        "web.assets_backend": [
            "o3p_widgets/static/src/js/list_renderer_minimum_lines.js",
            "o3p_widgets/static/src/js/notebook_tab_persistence.js",
            "o3p_widgets/static/src/js/text_field_autoresize.js",
        ],
    },
    "installable": True,
    "application": False,
    "auto_install": False,
}
