export interface Channel {
  id:          string
  name:        string
  logo?:       string
  categoryId?: string
  streamUrl:   string
  type:        'live'
}

export interface Category {
  id:   string
  name: string
}

export interface Provider {
  getCategories():                          Promise<Category[]>
  getLiveChannels(categoryId?: string):     Promise<Channel[]>
}
