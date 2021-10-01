<?php


namespace App\Events;


use App\Entity\User;
use Lexik\Bundle\JWTAuthenticationBundle\Event\JWTCreatedEvent;

class JwtCreatedSubscriber
{
    public function updateJwtData(JWTCreatedEvent $event)
    {
        /** @var User $user */
        $user = $event->getUser();
        $data = $event->getData();

        $data["firstname"] = $user->getFirstname();
        $data["lastname"] = $user->getLastname();

        $event->setData($data);
    }
}
