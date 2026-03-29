import User from "../models/user.model.js"
import UrlModel from "../models/short_url.model.js"
import { getCachedUserUrls, setCachedUserUrls } from "../services/cache.service.js"

export const findUserByEmail = async (email) => {
    return await User.findOne({email})
}

export const findUserByEmailByPassword = async (email) => {
    return await User.findOne({email}).select('+password')
}

export const findUserById = async (id) => {
    return await User.findById(id)
}

export const createUser = async (name, email, password) => {
    const newUser = new User({name, email, password})
    await newUser.save()
    return newUser
}

/**
 * Get all URLs for a user with Redis caching
 */
export const getAllUserUrlsDao = async (id) => {
    // Try cache first
    const cached = await getCachedUserUrls(id.toString())
    if (cached) {
        console.log(`📦 Cache HIT for user URLs: ${id}`)
        return cached
    }
    
    // Cache miss - query database
    console.log(`📭 Cache MISS for user URLs: ${id}`)
    const urls = await UrlModel.find({ user: id })
        .select('-clickDetails') // Exclude click details for list view (performance)
        .sort({ createdAt: -1 })
        .lean()
    
    // Cache the result
    await setCachedUserUrls(id.toString(), urls)
    
    return urls
}