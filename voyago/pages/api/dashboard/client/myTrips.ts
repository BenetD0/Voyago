import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../../src/lib/db';
import Trip from '../../../../src/models/Trip';
import { getRequestAuth } from "../../../../src/lib/auth";

export default async function getMyTrips(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ message: 'Method not allowed' });
    }       
    try {
        const token = await getRequestAuth(req);
        if (!token?.email) {
            return res.status(401).json({ message: 'Unauthorized' });
        }   
        await dbConnect();
        const trips = await Trip.find({ userEmail: token.email }).sort({ createdAt: -1 });
        return res.status(200).json(trips);
    } catch (error) {
        console.error('Error fetching trips:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
