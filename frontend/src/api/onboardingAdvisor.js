import api from './index'

export const getSuggestion = (profileData) => {
  console.log('Sending to suggest:', JSON.stringify(profileData, null, 2))
  return api.post('/onboarding/suggest', profileData).then(r => r.data)
}
