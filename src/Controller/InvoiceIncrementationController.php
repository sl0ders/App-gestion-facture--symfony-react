<?php

namespace App\Controller;

use App\Entity\Invoice;
use Doctrine\Persistence\ObjectManager;


class InvoiceIncrementationController
{

    public function __invoke(Invoice $data,ObjectManager $manager)
    {
        $data->setChrono($data->getChrono() + 1);

        $manager->flush();

        return $data;
    }
}
