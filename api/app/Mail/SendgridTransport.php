<?php

namespace App\Mail;

class SendgridTransport
{
    private $apiKey;

    public function __construct($apiKey)
    {
        $this->apiKey = $apiKey;
    }

    public function send($message)
    {
        $to = $message->getTo();
        $toEmail = key($to);
        
        $from = $message->getFrom();
        $fromEmail = key($from);
        
        $payload = [
            'personalizations' => [
                [
                    'to' => [
                        ['email' => $toEmail]
                    ]
                ]
            ],
            'from' => [
                'email' => $fromEmail
            ],
            'subject' => $message->getSubject(),
            'content' => [
                [
                    'type' => 'text/html',
                    'value' => $message->getBody()
                ]
            ]
        ];

        $ch = curl_init('https://api.sendgrid.com/v3/mail/send');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $this->apiKey,
            'Content-Type: application/json',
        ]);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode >= 200 && $httpCode < 300) {
            return $response;
        }

        throw new \Exception("SendGrid API error: HTTP {$httpCode} - {$response}");
    }
}

