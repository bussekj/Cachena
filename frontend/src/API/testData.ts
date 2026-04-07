import { User, TUO } from './interfaces.ts'
import {userData} from './userAPI.ts'
import {TUOData} from './trackedUserObjectAPI.ts'

export const testUsers : userData[] = [
    {
        name: 'John',
        password:"password",
        email: "email@email.com",
        role: 'worker'
    },
    
    {
        name: 'Allison',
        password:"password",
        email: "Allison@email.com",
        role: 'worker'
    },
    
    {
        name: 'Thomas',
        password:"password",
        email: "Thomas@email.com",
        role: 'worker'
    },
    
    {
        name: 'Fred',
        password:"password",
        email: "Fred@email.com",
        role: 'worker'
    }


]

export const testTuos : TUOData[] = [
    // Test Harnesses (10)
    { name: 'Test Harness 1', description: '["CI-3", "test", "harness"]', is_locked: false },
    { name: 'Test Harness 2', description: '["CI-2", "test", "harness"]', is_locked: false },
    { name: 'Test Harness 3', description: '["CI-42", "test", "harness"]', is_locked: false },
    { name: 'Test Harness 4', description: '["CI-3", "test", "harness"]', is_locked: false },
    { name: 'Test Harness 5', description: '["CI-2", "test", "harness"]', is_locked: false },
    { name: 'Test Harness 6', description: '["CI-42", "test", "harness"]', is_locked: false },
    { name: 'Test Harness 7', description: '["CI-8", "test", "harness"]', is_locked: false },
    { name: 'Test Harness 8', description: '["CI-9", "test", "harness"]', is_locked: false },
    { name: 'Test Harness 9', description: '["CI-10", "test", "harness"]', is_locked: false },
    { name: 'Test Harness 10', description: '["CI-11", "test", "harness"]', is_locked: false },

    // Vehicles (3)
    { name: "Keegan's Car", description: '["vehicle", "outdoor", "shipping"]', is_locked: false },
    { name: 'Company Van 1', description: '["vehicle", "outdoor", "shipping"]', is_locked: false },
    { name: 'Forklift A', description: '["vehicle", "warehouse", "shipping"]', is_locked: false },

    // Carts (5)
    { name: 'cart 1', description: '["shipping", "logistics"]', is_locked: false },
    { name: 'cart 4', description: '["shipping", "logistics"]', is_locked: false },
    { name: 'cart 7', description: '["shipping", "logistics"]', is_locked: false },
    { name: 'cart 10', description: '["shipping", "logistics", "Building 2"]', is_locked: false },
    { name: 'cart 12', description: '["shipping", "logistics"]', is_locked: false },

    // Soldering & Assembly Equipment (5)
    { name: 'Solder Station 1', description: '["Hot", "Building 2", "solder"]', is_locked: false },
    { name: 'Solder Station 2', description: '["Hot", "Building 2", "solder"]', is_locked: false },
    { name: 'Solder Station 3', description: '["Hot", "Building 2", "solder"]', is_locked: false },
    { name: 'Reflow Oven A', description: '["Hot", "Building 2", "solder", "heavy"]', is_locked: false },
    { name: 'Fume Extractor 1', description: '["Building 2", "safety"]', is_locked: false },

    // Bench Equipment - Oscilloscopes (6)
    { name: 'Oscilloscope 100MHz (Bench 1)', description: '["equipment", "bench", "calibration"]', is_locked: false },
    { name: 'Oscilloscope 100MHz (Bench 2)', description: '["equipment", "bench", "calibration"]', is_locked: false },
    { name: 'Oscilloscope 500MHz (Lab A)', description: '["equipment", "bench", "calibration", "high-freq"]', is_locked: false },
    { name: 'Oscilloscope 500MHz (Lab B)', description: '["equipment", "bench", "calibration", "high-freq"]', is_locked: false },
    { name: 'Portable Oscilloscope 1', description: '["equipment", "portable", "calibration"]', is_locked: false },
    { name: 'Portable Oscilloscope 2', description: '["equipment", "portable", "calibration"]', is_locked: false },

    // Bench Equipment - Multimeters (6)
    { name: 'Fluke DMM 1', description: '["equipment", "bench", "calibration"]', is_locked: false },
    { name: 'Fluke DMM 2', description: '["equipment", "bench", "calibration"]', is_locked: false },
    { name: 'Fluke DMM 3', description: '["equipment", "bench", "calibration"]', is_locked: false },
    { name: 'Keysight DMM A', description: '["equipment", "portable", "calibration"]', is_locked: false },
    { name: 'Keysight DMM B', description: '["equipment", "portable", "calibration"]', is_locked: false },
    { name: 'Keysight DMM C', description: '["equipment", "portable", "calibration"]', is_locked: false },

    // Power Supplies (5)
    { name: 'DC Power Supply 30V 1', description: '["equipment", "power", "bench"]', is_locked: false },
    { name: 'DC Power Supply 30V 2', description: '["equipment", "power", "bench"]', is_locked: false },
    { name: 'DC Power Supply 60V 1', description: '["equipment", "power", "high-voltage"]', is_locked: false },
    { name: 'AC Source 1', description: '["equipment", "power", "high-voltage"]', is_locked: false },
    { name: 'Electronic Load 1', description: '["equipment", "power", "test"]', is_locked: false },

    // Environmental & Mechanical Chambers (4)
    { name: 'Thermal Chamber A', description: '["test", "environmental", "Building 1"]', is_locked: false },
    { name: 'Thermal Chamber B', description: '["test", "environmental", "Building 1"]', is_locked: false },
    { name: 'Humidity Chamber', description: '["test", "environmental", "Building 1"]', is_locked: false },
    { name: 'Vibration Table 1', description: '["test", "mechanical", "heavy"]', is_locked: false },

    // RF & Connectivity Fixtures (4)
    { name: 'RF Shield Box A', description: '["RF", "specialized", "fixture"]', is_locked: false },
    { name: 'RF Shield Box B', description: '["RF", "specialized", "fixture"]', is_locked: false },
    { name: 'Bluetooth Sniffer', description: '["RF", "connectivity", "portable"]', is_locked: false },
    { name: 'Wi-Fi Protocol Analyzer', description: '["RF", "connectivity", "portable"]', is_locked: false },

    // Calibration Kits (2)
    { name: 'VNA Calibration Kit 1', description: '["calibration", "kit", "RF"]', is_locked: false },
    { name: 'Torque Wrench Cal Kit', description: '["calibration", "kit", "mechanical"]', is_locked: false }
]