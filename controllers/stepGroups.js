const Recipe = require('../models/recipe');

module.exports = {
    create,
    edit,
    update,
    delete: stepGroupDelete
};

function create(req, res) {
    Recipe.findById(req.params.id, (err, recipe) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to find the recipe' });
        }

        req.body.user = req.user._id;
        req.body.userName = req.user.name;
        req.body.userAvatar = req.user.avatar;

        recipe.stepGroups.push(req.body);
        recipe.save((err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to create a step group' });
            }
            res.redirect(`/recipes/${recipe._id}`);
        });
    });
}

function edit(req, res) {
    Recipe.findOne({ 'stepGroups._id': req.params.stepGroupId }, (err, recipe) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to find the step group' });
        }

        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        const stepGroup = recipe.stepGroups.id(req.params.stepGroupId);

        if (!stepGroup) {
            return res.status(404).json({ message: 'Step Group not found' });
        }

        res.render('stepGroups/edit', { title: 'Edit Group Name', recipe, stepGroup });
    });
}

function update(req, res) {
    Recipe.findOneAndUpdate(
        { 'stepGroups._id': req.params.stepGroupId },
        {
            $set: {
                'stepGroups.$.name': req.body.name,
            }
        },
        { new: true },
        (err, recipe) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to update the step group' });
            }

            if (!recipe) {
                return res.status(404).json({ message: 'Recipe not found' });
            }

            res.redirect(`/recipes/${recipe._id}`);
        }
    );
}

async function stepGroupDelete(req, res, next) {
    try {
        const recipe = await Recipe.findOne({ 'stepGroups._id': req.params.stepGroupId });

        if (!recipe) {
            return res.redirect('/recipes');
        }

        recipe.stepGroups.remove(req.params.stepGroupId);
        await recipe.save();
        res.redirect(`/recipes/${recipe._id}`);
    } catch (err) {
        return next(err);
    }
}