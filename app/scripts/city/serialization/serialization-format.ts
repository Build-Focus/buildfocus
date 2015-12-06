// This file just acts as a pointer to the current format, so we can update it without changing everywhere that
// doesn't actually care about the current details.

import currentFormat = require('./v2-serialization-format');
export = currentFormat;