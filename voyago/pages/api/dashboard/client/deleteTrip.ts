import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../../src/lib/db';
import Trip from '../../../../src/models/Trip';
import { getRequestAuth } from "../../../../src/lib/auth";

export default async function deleteTrip(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'DELETE') {
		res.setHeader('Allow', ['DELETE']);
		return res.status(405).json({ message: 'Method not allowed' });
	}

	try {
		const token = await getRequestAuth(req);

		if (!token?.email) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		const id = typeof req.query.id === 'string' ? req.query.id : '';

		if (!id) {
			return res.status(400).json({ message: 'Trip id is required' });
		}

		await dbConnect();

		const isAdmin = (token as { role?: string }).role === "admin";

		const trip = await Trip.findById(id);
		if (!trip) {
			return res.status(404).json({ message: 'Trip not found' });
		}

		if (!isAdmin && trip.userEmail !== token.email) {
			return res.status(403).json({ message: 'Forbidden' });
		}

		const deletedTrip = await Trip.findByIdAndDelete(id);

		if (!deletedTrip) {
			return res.status(404).json({ message: 'Trip not found' });
		}

		return res.status(200).json({ message: 'Trip deleted successfully', deletedTrip });
	} catch (error) {
		console.error('Error deleting trip:', error);
		return res.status(500).json({ message: 'Internal server error' });
	}
}
