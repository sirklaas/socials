import PocketBase from 'pocketbase';

// PocketBase instance - adjust URL as needed
const pb = new PocketBase('https://pinkmilk.pockethost.io');
pb.autoCancellation(false);

// Collection name for social content
const COLLECTION = 'socials';

/**
 * Get all social content records
 */
export async function getAllSocials() {
    try {
        const records = await pb.collection(COLLECTION).getFullList({
            sort: '-created',
        });
        return records;
    } catch (error) {
        console.error('Error fetching socials:', error);
        return [];
    }
}

/**
 * Get a single social content record by ID
 */
export async function getSocialById(id) {
    try {
        const record = await pb.collection(COLLECTION).getOne(id);
        return record;
    } catch (error) {
        console.error('Error fetching social:', error);
        return null;
    }
}

/**
 * Create a new social content record
 */
export async function createSocial(data) {
    try {
        const record = await pb.collection(COLLECTION).create({
            name: data.name || 'Untitled Campaign',
            concept: JSON.stringify(data.concept || {}),
            platforms: JSON.stringify(data.platforms || {}),
            visuals: JSON.stringify(data.visuals || {}),
            video: JSON.stringify(data.video || {}),
            blog: JSON.stringify(data.blog || {}),
            schedule: JSON.stringify(data.schedule || {}),
            language: data.language || 'nl',
            status: data.status || 'draft',
        });
        return record;
    } catch (error) {
        console.error('Error creating social:', error);
        throw error;
    }
}

/**
 * Update an existing social content record
 */
export async function updateSocial(id, data) {
    try {
        const updateData = {};

        if (data.name !== undefined) updateData.name = data.name;
        if (data.concept !== undefined) updateData.concept = JSON.stringify(data.concept);
        if (data.platforms !== undefined) updateData.platforms = JSON.stringify(data.platforms);
        if (data.visuals !== undefined) updateData.visuals = JSON.stringify(data.visuals);
        if (data.video !== undefined) updateData.video = JSON.stringify(data.video);
        if (data.blog !== undefined) updateData.blog = JSON.stringify(data.blog);
        if (data.schedule !== undefined) updateData.schedule = JSON.stringify(data.schedule);
        if (data.language !== undefined) updateData.language = data.language;
        if (data.status !== undefined) updateData.status = data.status;

        console.log('PocketBase Update Data:', updateData);

        const record = await pb.collection(COLLECTION).update(id, updateData);
        return record;
    } catch (error) {
        console.error('Error updating social:', error);
        throw error;
    }
}

/**
 * Delete a social content record
 */
export async function deleteSocial(id) {
    try {
        await pb.collection(COLLECTION).delete(id);
        return true;
    } catch (error) {
        console.error('Error deleting social:', error);
        throw error;
    }
}

/**
 * Get all records from a specific collection
 */
export async function getCollection(name) {
    try {
        const records = await pb.collection(name).getFullList();
        return records;
    } catch (error) {
        console.error(`Error fetching collection ${name}:`, error);
        return [];
    }
}

/**
 * Parse a social record from PocketBase format to app format
 */
export function parseSocialRecord(record) {
    return {
        id: record.id,
        name: record.name,
        concept: record.concept ? JSON.parse(record.concept) : {},
        platforms: record.platforms ? JSON.parse(record.platforms) : {},
        visuals: record.visuals ? JSON.parse(record.visuals) : {},
        video: record.video ? JSON.parse(record.video) : {},
        blog: record.blog ? JSON.parse(record.blog) : {},
        schedule: record.schedule ? JSON.parse(record.schedule) : {},
        language: record.language || 'nl',
        status: record.status || 'draft',
        created: record.created,
        updated: record.updated,
    };
}

export default pb;
