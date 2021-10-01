<?php

namespace App\Entity;

use ApiPlatform\Core\Annotation\ApiFilter;
use ApiPlatform\Core\Annotation\ApiResource;
use ApiPlatform\Core\Bridge\Doctrine\Orm\Filter\OrderFilter;
use ApiPlatform\Core\Bridge\Doctrine\Orm\Filter\SearchFilter;
use App\Repository\InvoiceRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints\Choice;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Constraints\Type;

/**
 * @ORM\Entity(repositoryClass=InvoiceRepository::class)
 */
#[
    ApiResource(
        itemOperations: [
        "GET", "PUT", "DELETE", "increment" => [
            "method" => "post",
            "path" => "/invoices/{id}/increment",
            "controller" => "App\Controller\InvoiceIncrementationController",
            "swagger_context" => [
                "summary" => "Incrémente une facture",
                "description" => "Incrémente le chrono d'une facture donnée"
            ]
        ]
    ],
        subresourceOperations: [
        "api_customers_invoices_get_subresource" => [
            "normalization_context" => ["groups" => ["invoices_subresource"]]
        ]
    ],
        attributes: [
        "pagination_enabled" => false,
        "pagination_items_per_page" => 20,
        'order' => ["sentAt" => "DESC"]
    ],
        denormalizationContext: [
        "disable_type_enforcement" => true
    ],
        normalizationContext: [
            "groups" => [
                "invoices_read"
            ]
        ]
    )]
#[ApiFilter(OrderFilter::class, properties: ["amount", "sentAt"])]
#[ApiFilter(SearchFilter::class)]
class Invoice
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue
     * @ORM\Column(type="integer")
     */
    #[Groups(["invoices_read", "customers_read", "invoices_subresource"])]
    private ?int $id;

    /**
     * @ORM\Column(type="float")
     */
    #[NotBlank(message: "Le montant de la facture est obligatoire")]
    #[Type(type: "numeric", message: "le montant de la facture doit etre un numerique")]
    #[Groups(["invoices_read", "customers_read", "invoices_subresource"])]
    private $amount;

    /**
     * @ORM\Column(type="datetime")
     */
    #[Groups(["invoices_read", "customers_read", "invoices_subresource"])]
    #[Type(type: "DateTimeInterface", message: "La date doit etre au format YYYY-MM-DD")]
    #[NotBlank(message: "La date doit etre renseignée")]
    private $sentAt;

    /**
     * @ORM\Column(type="string", length=255)
     */
    #[NotBlank(message: "le status doit etre renseigné")]
    #[Choice(choices: ["SENT", "PAID", "CANCELLED"], message: "Le statut doit etre SENT PAID ou CANCELLED")]
    #[Groups(["invoices_read", "customers_read", "invoices_subresource"])]
    private $status;

    /**
     * @ORM\ManyToOne(targetEntity=Customer::class, inversedBy="invoices")
     * @ORM\JoinColumn(nullable=false)
     */
    #[NotBlank(message: "Le client de la facture doit etre renseigné")]
    #[Groups(["invoices_read"])]
    private $customer;

    /**
     * @ORM\Column(type="integer")
     */
    #[NotBlank(message: "Le chrono doit etre renseigné")]
    #[Type(type: "numeric", message: "le chrono est un numerique")]
    #[Groups(["invoices_read", "customers_read", "invoices_subresource"])]
    private $chrono;

    public function getId(): ?int
    {
        return $this->id;
    }

    /**
     * Permet de recuperer le User a qui appartient la facture directement depuis la facture elle meme sans passer par le customer
     * @return User
     */
    #[Groups(["invoices_read", "invoices_subresource"])]
    public function getUser(): User
    {
        return $this->getCustomer()->getUser();
    }

    public function getAmount(): ?float
    {
        return $this->amount;
    }

    public function setAmount($amount): self
    {
        $this->amount = $amount;

        return $this;
    }

    public function getSentAt()
    {
        return $this->sentAt;
    }

    public function setSentAt($sentAt): self
    {
        $this->sentAt = $sentAt;

        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(string $status): self
    {
        $this->status = $status;

        return $this;
    }

    public function getCustomer(): ?Customer
    {
        return $this->customer;
    }

    public function setCustomer(?Customer $customer): self
    {
        $this->customer = $customer;

        return $this;
    }

    public function getChrono(): ?int
    {
        return $this->chrono;
    }

    public function setChrono($chrono): self
    {
        $this->chrono = $chrono;

        return $this;
    }
}
