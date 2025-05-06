const express = require('express');
const router = express.Router();
const { Category } = require('../models/category');


router.get(`/`, async (req, res) => {
    const categoryList = await Category.find();
    if (!categoryList) {
        res.status(500).json({ success: false })
    }
    res.status(200).send(categoryList);

});

// finding categories by Id
router.get('/:id', async(req, res) => {
    const category = await Category.findById(req.params.id)

    if (!category)
        return res.status(500).json({ message: 'The category with the Id cannot was not found' })

    res.status(200).send(category);
})

// updating category
//updating data in the database
router.put('/:id', async(req, res)=>{
    const category = await Category.findByIdAndUpdate(
    req.params.id,
    {
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    },
    {new: true}
    )
    //if there is data inside the category
    if (!category)
        return res.status(400).json({ message: 'The category cannot be created' })

    res.send(category);

})

router.post('/', async (req, res) => {
    const { name, icon, color } = req.body;

    // Validation: all fields required
    if (!name || !icon || !color) {
        return res.status(400).json({
            data: null,
            message: 'All fields are required',
        });
    }

    // Check if category with same name exists
    const checkExistingCategory = await Category.findOne({ name: name });
    if (checkExistingCategory) {
        return res.status(409).json({
            data: null,
            message: 'Category with this name already exists',
        });
    }

    // Create and save new category
    let category = new Category({ name, icon, color });

    category = await category.save();
    if (!category) {
        return res.status(500).send('The category could not be created');
    }

    return res.status(200).json({
        data: category,
        message: "Category created successfully",
    });
});


//delete category
//api/v1/id
// DELETE category
router.delete('/:id', async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Category deleted successfully",
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message,
        });
    }
});



module.exports = router;
