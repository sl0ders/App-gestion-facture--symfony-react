<?php

namespace App\Entity;

use ApiPlatform\Core\Annotation\ApiFilter;
use ApiPlatform\Core\Annotation\ApiResource;
use ApiPlatform\Core\Annotation\ApiSubresource;
use ApiPlatform\Core\Bridge\Doctrine\Orm\Filter\SearchFilter;
use App\Repository\CustomerRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints\Email;
use Symfony\Component\Validator\Constraints\Length;
use Symfony\Component\Validator\Constraints\NotBlank;

/**
 * @ORM\Entity(repositoryClass=CustomerRepository::class)
 */
#[ApiResource(
    collectionOperations: ["GET","POST"],
    itemOperations:["GET", "PUT","DELETE","PATCH"],
    subresourceOperations: [
        "invoices_get_subresource" =>[
            "path" => "/customers/{id}/invoices"
        ]
    ],
    normalizationContext: [
        "groups" => [
            "customers_read"
        ]
    ]
)]
#[ApiFilter(
    SearchFilter::class,
    strategy: "exact",
    properties: ["firstname" => "partial", "lastname", "company"]
)]
class Customer
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue
     * @ORM\Column(type="integer")
     */
    #[Groups(["customers_read","invoices_read"])]
    private $id;

    /**
     * @ORM\Column(type="string", length=255)
     */
    #[NotBlank(message: "Le prenom ne peut etre vide")]
    #[Length(min: 3, minMessage: "Le prenom ne doit pas faire moin de 3 caractere")]
    #[Groups(["customers_read","invoices_read"])]
    private $firstname;

    /**
     * @ORM\Column(type="string", length=255)
     */
    #[NotBlank(message: "Le nom ne peut etre vide")]
    #[Length(min: 3, minMessage: "Le nom ne doit pas faire moin de 3 caractere")]
    #[Groups(["customers_read","invoices_read"])]
    private $lastname;

    /**
     * @ORM\Column(type="string", length=255)
     */
    #[NotBlank(message: "L'email ne peut etre vide")]
    #[Email( message: "Le format de l'email n'est pas bon")]
    #[Groups(["customers_read","invoices_read"])]
    private $email;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    #[Groups(["customers_read","invoices_read"])]
    private $company;

    /**
     * @ORM\OneToMany(targetEntity=Invoice::class, mappedBy="customer")
     */
    #[Groups(["customers_read"])]
    #[ApiSubresource]
    private $invoices;

    /**
     * @ORM\ManyToOne(targetEntity=User::class, inversedBy="customers")
     */
    #[Groups(["customers_read"])]
    #[NotBlank(message: "L'utilisateur est obligatoire")]
    private $user;

    public function __construct()
    {
        $this->invoices = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    /**
     * @return float
     * Permet de recuperer le total des invoices pour le customer
     */
    #[Groups(["customers_read"])]
    public function getTotalAmount():float {
        return array_reduce($this->getInvoices()->toArray(), function($total, $invoice) {
            return $total + $invoice->getAmount();
        },0);
    }

    /**
     * Récuperer le montant total non payé (montant total hors factures payées ou annulées)
     * @return float
     */
    #[Groups(["customers_read"])]
    public function getUnpaidAmount():float {
        return array_reduce($this->getInvoices()->toArray(), function($total, $invoice) {
            return $total + ($invoice->getStatus() === "PAID" || $invoice->getStatus() === "CANCELLED" ? 0 : $invoice->getAmount());
        },0);
    }
    public function getFirstname(): ?string
    {
        return $this->firstname;
    }

    public function setFirstname(string $firstname): self
    {
        $this->firstname = $firstname;

        return $this;
    }

    public function getLastname(): ?string
    {
        return $this->lastname;
    }

    public function setLastname(string $lastname): self
    {
        $this->lastname = $lastname;

        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): self
    {
        $this->email = $email;

        return $this;
    }

    public function getCompany(): ?string
    {
        return $this->company;
    }

    public function setCompany(?string $company): self
    {
        $this->company = $company;

        return $this;
    }

    /**
     * @return Collection|Invoice[]
     */
    public function getInvoices(): Collection
    {
        return $this->invoices;
    }

    public function addInvoice(Invoice $invoice): self
    {
        if (!$this->invoices->contains($invoice)) {
            $this->invoices[] = $invoice;
            $invoice->setCustomer($this);
        }

        return $this;
    }

    public function removeInvoice(Invoice $invoice): self
    {
        if ($this->invoices->removeElement($invoice)) {
            // set the owning side to null (unless already changed)
            if ($invoice->getCustomer() === $this) {
                $invoice->setCustomer(null);
            }
        }

        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): self
    {
        $this->user = $user;

        return $this;
    }
}
