import React, { useState } from 'react';
import axios from 'axios';

const EventUpdate = () => {
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
            await axios.put('/api/events/:id', formData);
            alert('Event created successfully');
            // Reset form
            setFormData({
                courseName: '',
                venue: '',
                date: '',
                price: '',
                emailText: ''
            });
        } catch (error) {
            console.error('Error creating event:', error);
            alert('Error creating event');
        }
    };

    return (
        <div className="container">
            <h2>Create New Event</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Course Name:</label>
                    <input
                        type="text"
                        name="courseName"
                        value={formData.courseName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Venue:</label>
                    <input
                        type="text"
                        name="venue"
                        value={formData.venue}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Date:</label>
                    <input
                        type="datetime-local"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Price:</label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Email Text:</label>
                    <textarea
                        name="emailText"
                        value={formData.emailText}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit">Create Event</button>
            </form>
        </div>
    );
};

export default EventUpdate;