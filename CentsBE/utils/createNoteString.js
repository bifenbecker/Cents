const createNoteString = (item) => {
    const arrayOfStrings = [];
    if (item?.notes?.length > 0) {
        item.notes.forEach((note) => {
            if (note.name.length > 0) {
                arrayOfStrings.push(note.name);
            }
        });
    }
    if (item?.manualNote && item?.manualNote.length > 0) {
        arrayOfStrings.push(item.manualNote);
    }
    return arrayOfStrings.join(', ');
};

module.exports = exports = createNoteString;
