import React, { useState } from 'react';
import axios from 'axios';

const EventCreate = () => {
    const [formData, setFormData] = useState({
        courseName: '',
        venue: '',
        date: '',
        price: '',
        emailText: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/events', formData);
            console.log('Event created successfully:', response.data);
        } catch (error) {
            console.error('Error creating event:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Course Name:</label>
                <input type="text" name="courseName" value={formData.courseName} onChange={handleChange} required />
            </div>
            <div>
                <label>Venue:</label>
                <input type="text" name="venue" value={formData.venue} onChange={handleChange} required />
            </div>
            <div>
                <label>Date:</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} required />
            </div>
            <div>
                <label>Price:</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} required />
            </div>
            <div>
                <label>Email Text:</label>
                <textarea name="emailText" value={formData.emailText} onChange={handleChange} required></textarea>
            </div>
            <button type="submit">Create Event</button>
        </form>
    );
};

export default EventCreate;