# mongoose-auto-increment
This plugin allows you to auto-increment any field on any mongoose schema that you wish.

## Getting Started

> npm install mongoose-auto-increment

Once you have the plugin installed it is very simple to use. Just get reference to it, initialize it by passing in your
mongoose connection and pass `autoIncrement.plugin` to the `plugin()` function on your schema.

> Note: You only need to initialize autoIncrement once.

    var mongoose = require('mongoose'),
        autoIncrement = require('mongoose-auto-increment');

    autoIncrement.initialize(mongoose.connection);

    var bookSchema = new mongoose.Schema({
        author: { type: Schema.Types.ObjectId, ref: 'Author' },
        title: String,
        genre: String,
        publishDate: Date
    });

    bookSchema.plugin(autoIncrement.plugin, 'Book');
    mongoose.model('Book', bookSchema);

That's it. Now you can create book entities at will and the `_id` field will automatically increment with each new document.

### Want a field other than `_id`?

    bookSchema.plugin(autoIncrement.plugin, { model: 'Book', field: 'sequence' });

### Want that field to start at a different number than zero or increment by more than one?

    bookSchema.plugin(autoIncrement.plugin, {
        model: 'Book',
        field: 'sequence',
        startAt: 100,
        incrementBy: 100
    });

Your first book document would have an `_id` equal to `100`. Your second book document would have an `_id` equal to `200`, and so on.

### Want your field to increment every time you update it too?

    bookSchema.plugin(autoIncrement.plugin, {
        model: 'Book',
        field: 'sequence',
        startAt: 100,
        incrementBy: 100,
        incrementOnUpdate: true
    });