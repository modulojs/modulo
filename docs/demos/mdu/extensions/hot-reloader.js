// Idea:

// - Poll all loaded files
// - If possible use OPTION / HEAD or something just to check timestamps
// - If a change is detected, do a force reload of ENTIRE page
// - Before reload, querySelectorAll('*') and run lifecycle('saveState')
// - After reload, lifecycle('loadState')

// - Attach to State.prototype.saveState which serializes to local storage, etc
// - If it can detect which State belongs to this, it will attempt to resurrect
//   the previous state


