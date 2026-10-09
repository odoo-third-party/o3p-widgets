from odoo import api, fields, models, _
from odoo.exceptions import ValidationError

from .ir_http import (
    MINIMUM_LISTS_LINES_PARAM,
    MINIMUM_TEXT_LINES_PARAM,
    NATIVE_MINIMUM_LISTS_LINES,
    NATIVE_MINIMUM_TEXT_LINES,
)


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    minimum_text_lines = fields.Integer(
        string="Minimum text lines",
        config_parameter=MINIMUM_TEXT_LINES_PARAM,
        default=NATIVE_MINIMUM_TEXT_LINES,
    )
    minimum_lists_lines = fields.Integer(
        string="Minimum list lines",
        config_parameter=MINIMUM_LISTS_LINES_PARAM,
        default=NATIVE_MINIMUM_LISTS_LINES,
    )

    @api.constrains("minimum_text_lines")
    def _check_minimum_text_lines(self):
        if any(settings.minimum_text_lines < 1 for settings in self):
            raise ValidationError(_("Minimum text lines must be at least 1."))

    @api.constrains("minimum_lists_lines")
    def _check_minimum_lists_lines(self):
        if any(settings.minimum_lists_lines < 0 for settings in self):
            raise ValidationError(_("Minimum list lines cannot be negative."))
