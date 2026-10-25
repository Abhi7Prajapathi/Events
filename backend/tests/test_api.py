import os
import sys
import unittest
from unittest.mock import patch, MagicMock

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app
from brevo_service import (
    build_welcome_html,
    build_event_confirmation_html,
    get_brevo_config,
)


class TestCampusCircleAPI(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        self.client = app.test_client()

    def test_app_created(self):
        """Test Flask application initializes properly."""
        self.assertIsNotNone(app)
        self.assertTrue(app.config['TESTING'])

    def test_welcome_email_template(self):
        """Ensure welcome email template includes student details, college info, and no third-party branding."""
        sample_user = {
            'name': 'Abhilash R',
            'email': 'abhilash@example.com',
            'reg_no': '610825BIT001',
            'department': 'Information Technology',
            'class': 'IV Year',
        }
        html = build_welcome_html(sample_user)
        self.assertIn('Abhilash R', html)
        self.assertIn('610825BIT001', html)
        self.assertIn('Information Technology', html)
        self.assertIn('Er. Perumal Manimekalai College of Engineering', html)
        self.assertIn('https://campuscirclepmc.vercel.app', html)
        # Verify "Powered by Brevo" is NOT present
        self.assertNotIn('Powered by Brevo', html)

    def test_event_confirmation_email_template(self):
        """Ensure event confirmation template has event schedule, venue, and clean college footer."""
        sample_user = {'name': 'Abhilash R', 'email': 'abhilash@example.com'}
        sample_event = {
            'title': 'CodeCraft Hackathon',
            'category': 'Technical',
            'date': '2026-10-11',
            'time': '09:00 AM',
            'venue': 'C Block Auditorium',
            'description': '24-hour hackathon with mentoring.',
        }
        html = build_event_confirmation_html(sample_user, sample_event)
        self.assertIn('CodeCraft Hackathon', html)
        self.assertIn('Technical', html)
        self.assertIn('C Block Auditorium', html)
        self.assertIn('09:00 AM', html)
        self.assertIn('Abhilash R', html)
        self.assertIn('https://campuscirclepmc.vercel.app', html)
        # Verify "Powered by Brevo" is NOT present
        self.assertNotIn('Powered by Brevo', html)

    def test_brevo_config_default_sender(self):
        """Ensure default sender name falls back to Campus Circle."""
        with patch.dict(os.environ, {'BREVO_API_KEY': 'test_key', 'BREVO_SENDER_EMAIL': 'events@campus.edu'}):
            api_key, email, name = get_brevo_config()
            self.assertEqual(api_key, 'test_key')
            self.assertEqual(email, 'events@campus.edu')
            self.assertEqual(name, 'Campus Circle')

    def test_register_user_missing_required_fields(self):
        """API should reject user registration if required fields are missing."""
        response = self.client.post('/api/register-user', json={
            'name': 'Test User',
            # missing email, password, reg_no, department, class
        })
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertIn('error', data)

    def test_login_missing_credentials(self):
        """API should reject login with missing credentials."""
        response = self.client.post('/api/login', json={})
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertIn('error', data)

    def test_test_email_missing_recipient(self):
        """Test diagnostic route requires an email parameter."""
        response = self.client.post('/api/test-email', json={})
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertIn('error', data)


if __name__ == '__main__':
    unittest.main()
