from odoo import models


MINIMUM_TEXT_LINES_PARAM = "o3p_widgets.minimum_text_lines"
NATIVE_MINIMUM_TEXT_LINES = 2
MINIMUM_LISTS_LINES_PARAM = "o3p_widgets.minimum_lists_lines"
NATIVE_MINIMUM_LISTS_LINES = 4
REMEMBER_NOTEBOOK_TABS_PARAM = "o3p_widgets.remember_notebook_tabs"


class IrHttp(models.AbstractModel):
    _inherit = "ir.http"

    def session_info(self):
        result = super().session_info()
        minimum_text_lines = (
            self.env["ir.config_parameter"]
            .sudo()
            .get_int(MINIMUM_TEXT_LINES_PARAM, NATIVE_MINIMUM_TEXT_LINES)
        )
        minimum_lists_lines = (
            self.env["ir.config_parameter"]
            .sudo()
            .get_int(MINIMUM_LISTS_LINES_PARAM, NATIVE_MINIMUM_LISTS_LINES)
        )
        remember_notebook_tabs = (
            self.env["ir.config_parameter"]
            .sudo()
            .get_bool(REMEMBER_NOTEBOOK_TABS_PARAM, False)
        )
        result["o3p_widgets"] = {
            "minimum_text_lines": max(1, minimum_text_lines),
            "minimum_lists_lines": max(0, minimum_lists_lines),
            "remember_notebook_tabs": remember_notebook_tabs,
        }
        return result
