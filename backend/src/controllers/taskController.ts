import Task from '../models/taskModel.js';
import type { Request, Response } from 'express';


export const createTask = async (req: Request, res: Response) => {
    try {
        const { title, description } = req.body;
        const task = await Task.create({ title, description });
        res.status(201).json({ message: 'Tạo task thành công', task });
    }
    catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Lỗi khi tạo task'});
    }
};

export const getTask = async (req: Request, res: Response) => {
    try{
        const tasks = await Task.find();
        res.status(201).json({ message: 'Lấy danh sách task thành công', tasks });
    }
    catch (error) {
        res.status(400).json({ message: 'Lỗi khi lấy danh sách', error });
    }
};

export const updateTask = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, description, status, completedAt } = req.body;
        const task = await Task.findByIdAndUpdate(id, { title, description, status, completedAt }, { new: true });
        res.status(200).json({ message: 'Cập nhật task thành công', task});
    }
    catch (error) {
        res.status(400).json({ message: 'Lỗi khi cập nhật task', error });
    }
};

export const deleteTask = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const task = await Task.findByIdAndDelete(id);
        res.status(200).json({ meesage: 'Xóa task thành công', task});
    }
    catch (error) {
        res.status(400).json({ message: 'Lỗi khi xóa task', error });
    }
};