<?php

namespace App\Mail;

use Symfony\Component\Mailer\SmailerInterface;
use Symfony\Component\Mime\Email;

class SendgridTransport implements SmailerInterface
{
    private $apiKey;

    public function __construct($apiKey)
    {
        $this->apiKey = $apiKey;
    }

    public function send(Email $email): ?string
    {
        $from = $email->getFrom();
        $fromEmail = current($from)->getAddress();
        
        $to = $email->getTo();
        $toEmail = current($to)->getAddress();
        
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
            'subject' => $email->getSubject(),
            'content' => [
                [
                    'type' => 'text/html',
                    'value' => $email->getHtmlBody() ?? $email->getTextBody()
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

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode >= 200 && $httpCode < 300) {
            return $email->getSubject();
        }

        throw new \Exception("SendGrid API error: HTTP {$httpCode}");
    }
}
