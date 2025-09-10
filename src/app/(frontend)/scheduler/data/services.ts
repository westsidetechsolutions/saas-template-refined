export interface Service {
  id: string
  name: string
  description: string
  duration: number
  price: number
  category: string
  available: boolean
}

export const services: Service[] = [
  {
    id: 'ac-repair',
    name: 'AC Repair',
    description: 'Diagnosis and repair of air conditioning systems',
    duration: 2,
    price: 200,
    category: 'HVAC',
    available: true,
  },
  {
    id: 'heating-inspection',
    name: 'Heating Inspection',
    description: 'Comprehensive heating system inspection and maintenance',
    duration: 1.5,
    price: 150,
    category: 'HVAC',
    available: true,
  },
  {
    id: 'duct-cleaning',
    name: 'Duct Cleaning',
    description: 'Professional air duct cleaning and sanitization',
    duration: 3,
    price: 300,
    category: 'HVAC',
    available: true,
  },
  {
    id: 'thermostat-installation',
    name: 'Thermostat Installation',
    description: 'Smart thermostat installation and setup',
    duration: 1,
    price: 120,
    category: 'HVAC',
    available: true,
  },
]

export const getServiceById = (id: string): Service | undefined => {
  return services.find((service) => service.id === id)
}

export const getServicesByCategory = (category: string): Service[] => {
  return services.filter((service) => service.category === category)
}
