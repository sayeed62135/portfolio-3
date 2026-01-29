<?php
/**
 * Contact Form PHP Backend
 * Simple, secure contact form handler
 * 
 * SETUP:
 * 1. Update $to_email with your email address
 * 2. Upload this file to your server
 * 3. Make sure your server supports mail() function
 * 4. Enable customPHP in contact-form.js config
 */

// Configuration
$to_email = "sayeed.swadeshit@gmail.com"; // YOUR EMAIL HERE
$subject_prefix = "Portfolio Contact: ";

// CORS headers (adjust for your domain in production)
header('Access-Control-Allow-Origin: *'); // Change * to your domain
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Get JSON data
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Validate data
if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
    exit();
}

// Required fields
$required_fields = ['name', 'email', 'subject', 'message'];
foreach ($required_fields as $field) {
    if (empty($data[$field])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => "Missing required field: $field"]);
        exit();
    }
}

// Sanitize inputs
$name = filter_var($data['name'], FILTER_SANITIZE_STRING);
$email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
$subject = filter_var($data['subject'], FILTER_SANITIZE_STRING);
$message = filter_var($data['message'], FILTER_SANITIZE_STRING);

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email address']);
    exit();
}

// Basic spam protection
$spam_words = ['viagra', 'casino', 'lottery', 'winner'];
$message_lower = strtolower($message);
foreach ($spam_words as $word) {
    if (strpos($message_lower, $word) !== false) {
        // Log spam attempt but don't tell the sender
        error_log("Spam detected from: $email");
        echo json_encode(['success' => true, 'message' => 'Message sent successfully']);
        exit();
    }
}

// Rate limiting (simple session-based)
session_start();
$last_submission_time = isset($_SESSION['last_submission']) ? $_SESSION['last_submission'] : 0;
$time_diff = time() - $last_submission_time;

if ($time_diff < 60) { // 1 minute cooldown
    http_response_code(429);
    echo json_encode(['success' => false, 'message' => 'Please wait before sending another message']);
    exit();
}

// Prepare email
$email_subject = $subject_prefix . $subject;
$email_body = "New contact form submission:\n\n";
$email_body .= "Name: $name\n";
$email_body .= "Email: $email\n";
$email_body .= "Subject: $subject\n\n";
$email_body .= "Message:\n$message\n";

// Email headers
$headers = "From: $name <$email>\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// Send email
$mail_sent = mail($to_email, $email_subject, $email_body, $headers);

if ($mail_sent) {
    // Update rate limit
    $_SESSION['last_submission'] = time();
    
    // Optional: Log successful submission
    error_log("Contact form submitted by: $email");
    
    http_response_code(200);
    echo json_encode([
        'success' => true, 
        'message' => 'Message sent successfully'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Failed to send message. Please try again later.'
    ]);
}
?>
