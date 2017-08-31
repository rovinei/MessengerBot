var cfg = {};

cfg.fb_verify_token = process.env.FB_VERIFY_TOKEN || "";
cfg.page_access_token = process.env.FB_PAGE_ACCESS_TOKEN || "";
cfg.open_weather_api_key = process.env.OPEN_WEATHER_API_KEY || "";

module.exports = cfg;
