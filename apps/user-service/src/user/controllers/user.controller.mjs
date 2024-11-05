import { UserModel } from '../index.mjs';

// Get a user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a user by a specific field (e.g., email)
export const getOneUser = async (req, res) => {
  try {
    const user = await UserModel.findOne(req.query); // Use query parameters for filtering
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get count of all users
export const getAllUsersCount = async (req, res) => {
  try {
    const count = await UserModel.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new user
export const createUser = async (req, res) => {
  const userData = req.body;
  try {
    const newUser = new UserModel(userData);
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a user by ID
export const updateUser = async (req, res) => {
  try {
    const user = await UserModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update multiple users based on criteria
export const updateManyUsers = async (req, res) => {
  try {
    const result = await UserModel.updateMany(req.query, req.body, { new: true, runValidators: true });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a user by ID
export const deleteUser = async (req, res) => {
  try {
    const user = await UserModel.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete multiple users based on criteria
export const deleteManyUsers = async (req, res) => {
  try {
    const result = await UserModel.deleteMany(req.query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
