import { getShortUrl } from "../dao/short_url.js"
import { createShortUrlWithoutUser, createShortUrlWithUser } from "../services/short_url.service.js"
import { trackClick } from "../services/analytics.service.js"
import wrapAsync from "../utils/tryCatchWrapper.js"

export const createShortUrl = wrapAsync(async (req,res)=>{
    const data = req.body
    let shortUrl
    if(req.user){
        shortUrl = await createShortUrlWithUser(data.url,req.user._id,data.slug)
    }else{  
        shortUrl = await createShortUrlWithoutUser(data.url)
    }
    res.status(200).json({shortUrl : process.env.APP_URL + shortUrl})
})


export const redirectFromShortUrl = wrapAsync(async (req,res)=>{
    const {id} = req.params
    const startTime = Date.now()
    
    const url = await getShortUrl(id)
    
    if(!url) {
        return res.status(404).json({ error: "Short URL not found" })
    }
    
    // Log latency for monitoring
    const latency = Date.now() - startTime
    if (latency > 50) {
        console.log(`⚠️  Redirect latency: ${latency}ms for ${id}`)
    }
    
    // Track analytics asynchronously (non-blocking)
    trackClick(id, req).catch(err => 
        console.error('Analytics tracking failed:', err.message)
    )
    
    res.redirect(url.full_url)
})

export const createCustomShortUrl = wrapAsync(async (req,res)=>{
    const {url,slug} = req.body
    const shortUrl = await createShortUrlWithoutUser(url,customUrl)
    res.status(200).json({shortUrl : process.env.APP_URL + shortUrl})
})