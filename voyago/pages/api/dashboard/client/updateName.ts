import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../../src/lib/db';
import User from '../../../../src/models/User';
import { getRequestAuth } from "../../../../src/lib/auth";

export default async function updateName(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'PUT') {
        res.setHeader('Allow', ['PUT']);
        return res.status(405).json({ message: 'Method not allowed' });
    }   

    try {
        const token = await getRequestAuth(req);

        if (!token?.email) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        await dbConnect();

        const user = await User.findOne({ email: token.email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }       
        const { name } = req.body;
        if (name) {
            user.name = name;
        }
        await user.save();

        return res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
        });
    } catch (error) {
        console.error('updateUser error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }       
}   
