const { Train, TrainCategory } = require('../models');

module.exports = {
  async getAllTrainCategory(req, res) {
    try {
      const train_categories = await TrainCategory.findAll({
      });
      res.json(train_categories);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch train categories' });
    }
  },

  async getTrainCategoryById(req, res) {
    try {
      const train_category = await TrainCategory.findByPk(req.params.id, {
      });
      if (!train_category) return res.status(404).json({ error: 'Train Category not found' });
      res.json(train_category);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch train category' });
    }
  },

  async createTrainCategory(req, res) {
    try {
      const { category_name } = req.body;
      
      if (!category_name) {
        return res.status(400).json({ error: 'Category name is required' });
      }

      const newTrainCategory = await TrainCategory.create({ category_name });
      res.status(201).json(newTrainCategory);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create train category' });
    }
  },

  async updateTrainCategory(req, res) {
    try {
      const { category_name } = req.body;
      const trainCategory = await TrainCategory.findByPk(req.params.id);
      if (!trainCategory) return res.status(404).json({ error: 'Train Category not found' });

      await trainCategory.update({ category_name });
      res.json(trainCategory);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update train Category' });
    }
  },

  async deleteTrainCategory(req, res) {
    try {
      const trainCategory = await TrainCategory.findByPk(req.params.id);
      if (!trainCategory) return res.status(404).json({ error: 'Train Category not found' });

      await trainCategory.destroy();
      res.json({ message: 'Train Category deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete train Category' });
    }
  }
};