# Dropdown and popover

Menu: `<button popovertarget="m">Actions</button><menu popover id="m"><li><button>Edit</button></li><li><button data-danger>Delete</button></li></menu>`; arrows/Home/End move focus; closes on item click.
Popover: `<div popover id="p" data-placement="right-start">` (top|bottom|left|right + -start|-end; flips). Hover: `<button data-ms-hover-popover="#p2">` + `<div popover="manual" id="p2">`.
