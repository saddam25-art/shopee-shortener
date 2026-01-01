const ANDROID_PACKAGE_MY = 'com.shopee.my'
const IOS_APP_STORE_MY = 'https://apps.apple.com/my/app/shopee-my-12-12/id959841113'
const ANDROID_PLAY_STORE_MY = 'https://play.google.com/store/apps/details?id=com.shopee.my'

export function buildAndroidIntent({ webUrl }) {
  const u = new URL(webUrl)
  const hostAndPath = `${u.host}${u.pathname}${u.search}`
  const fallback = encodeURIComponent(webUrl)

  return `intent://${hostAndPath}#Intent;scheme=${u.protocol.replace(':', '')};package=${ANDROID_PACKAGE_MY};S.browser_fallback_url=${fallback};end`
}

export function getIosFallbackUrl() {
  return IOS_APP_STORE_MY
}

export function getAndroidFallbackUrl() {
  return ANDROID_PLAY_STORE_MY
}

export function buildIosSchemeUrl({ webUrl }) {
  return `shopee://open?url=${encodeURIComponent(webUrl)}`
}
