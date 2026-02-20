import axios from "axios";

const toast = useToast()

export async function searchLocation(query) {
    try {
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
            withCredentials:false,
            params: {
                q: query,
                format: 'json',
                addressdetails: 1,
                limit: 5,
            },
            headers: {
                'Accept-Language': 'en',
            }
        });
        return response.data;
    } catch (error) {
        toast.add({
            title: 'Uh oh! Something went wrong.',
            description: 'There was a problem with your request.',
            icon: 'i-lucide-wifi',
            color: "error"
        })
        return [];
    }
}