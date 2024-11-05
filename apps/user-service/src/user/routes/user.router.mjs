/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management operations
 */

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Retrieve a single user by ID
 *     tags: [Users]
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'  # Use the reusable schema
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Retrieve all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'  # Use the reusable schema
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/users/find:
 *   get:
 *     summary: Retrieve a user by a specific field (e.g., email)
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         description: User email
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/users/count:
 *   get:
 *     summary: Retrieve count of all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Count of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "john"
 *               lastName:
 *                 type: string
 *                 example: "doe"
 *               email:
 *                 type: string
 *                 example: "john.doe@example.com"
 *               phoneNumber:
 *                 type: string
 *                 example: "+1234567890"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               timezone:
 *                 type: string
 *                 example: "Asia/Kolkata"
 *               status:
 *                 type: boolean
 *                 example: true
 *               role:
 *                 type: string
 *                 enum: ['ADMIN', 'USER']
 *                 example: "USER"
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - phoneNumber
 *               - password
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/users/{id}:
 *   put:
 *     summary: Update an existing user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "john"
 *               lastName:
 *                 type: string
 *                 example: "doe"
 *               email:
 *                 type: string
 *                 example: "john.doe@example.com"
 *               phoneNumber:
 *                 type: string
 *                 example: "+1234567890"
 *               timezone:
 *                 type: string
 *                 example: "Asia/Kolkata"
 *               status:
 *                 type: boolean
 *               role:
 *                 type: string
 *                 enum: ['ADMIN', 'USER']
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/users/updateMany:
 *   patch:
 *     summary: Update multiple users based on criteria
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               criteria:
 *                 type: object
 *               update:
 *                 type: object
 *                 properties:
 *                   firstName:
 *                     type: string
 *                   lastName:
 *                     type: string
 *                   email:
 *                     type: string
 *                   phoneNumber:
 *                     type: string
 *                   timezone:
 *                     type: string
 *                   status:
 *                     type: boolean
 *                   role:
 *                     type: string
 *                     enum: ['ADMIN', 'USER']
 *     responses:
 *       200:
 *         description: Users updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 matchedCount:
 *                   type: integer
 *                 modifiedCount:
 *                   type: integer
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/users/deleteMany:
 *   delete:
 *     summary: Delete multiple users based on criteria
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               criteria:
 *                 type: object
 *     responses:
 *       200:
 *         description: Users deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 deletedCount:
 *                   type: integer
 *       500:
 *         description: Internal server error
 */

import express from 'express';
import { UserController } from '../index.mjs';
import { checkPermissionsByRole } from '../middlewares/authorization/admin.mjs';
import { checkPermissionsById } from '../middlewares/authorization/adminOrOwner.mjs';
const {
  getUserById,
  getAllUsers,
  getOneUser,
  getAllUsersCount,
  createUser,
  updateUser,
  updateManyUsers,
  deleteUser,
  deleteManyUsers,
} = UserController;

const router = express.Router();

router.get('/:id', checkPermissionsById, getUserById); // Get user by ID
router.get('/', checkPermissionsByRole, getAllUsers); // Get all users
router.get('/find', checkPermissionsByRole, getOneUser); // Get one user based on query params
router.get('/count', checkPermissionsByRole, getAllUsersCount); // Get count of all users

router.post('/', createUser); // Create a new user

router.put('/:id', checkPermissionsById, updateUser); // Update a user by ID
router.patch('/updateMany', checkPermissionsByRole, updateManyUsers); // Update multiple users based on criteria

router.delete('/:id', checkPermissionsById, deleteUser); // Delete a user by ID
router.delete('/deleteMany', checkPermissionsByRole, deleteManyUsers); // Delete multiple users based on criteria

export default router;
