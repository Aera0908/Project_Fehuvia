import { expect } from "chai";
import hre from "hardhat";

describe("Fehuvia Settlement Core Suite", function () {
  let mockUSDC;
  let b2bSettlement;
  let owner;
  let buyer;
  let supplier;
  let decimals;
  let ethers;

  beforeEach(async function () {
    // Create a network connection in Hardhat 3
    const connection = await hre.network.create();
    ethers = connection.ethers;

    // Get signers
    [owner, buyer, supplier] = await ethers.getSigners();

    // Deploy MockUSDC
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDC.deploy();
    await mockUSDC.waitForDeployment();

    decimals = await mockUSDC.decimals();

    // Deploy B2BSettlement, passing MockUSDC token address
    const B2BSettlement = await ethers.getContractFactory("B2BSettlement");
    b2bSettlement = await B2BSettlement.deploy(await mockUSDC.getAddress());
    await b2bSettlement.waitForDeployment();

    // Fund the buyer with 1,000 mock USDC for testing
    const fundAmount = ethers.parseUnits("1000", decimals);
    await mockUSDC.transfer(buyer.address, fundAmount);
  });

  describe("Mock USDC Stablecoin Faucet Tests", function () {
    it("Should initialize mUSDC with correct name, symbol, and 6 decimals precision", async function () {
      expect(await mockUSDC.name()).to.equal("Mock USDC");
      expect(await mockUSDC.symbol()).to.equal("mUSDC");
      expect(await mockUSDC.decimals()).to.equal(6n);
    });

    it("Should allow anyone to mint tokens via the public faucet", async function () {
      const mintAmount = ethers.parseUnits("500", decimals);
      await mockUSDC.connect(buyer).mint(buyer.address, mintAmount);

      const balance = await mockUSDC.balanceOf(buyer.address);
      expect(balance).to.equal(ethers.parseUnits("1500", decimals));
    });
  });

  describe("B2B Invoice Settlement Logic Tests", function () {
    it("Should settle a valid invoice, transfer mUSDC, mark state, and emit PaymentSettled event", async function () {
      const settleAmount = ethers.parseUnits("250", decimals);
      const invoiceId = "INV-TEST-001";

      // Buyer approves B2BSettlement contract to spend mUSDC
      await mockUSDC.connect(buyer).approve(await b2bSettlement.getAddress(), settleAmount);

      // Execute settlement and check event emission
      await expect(
        b2bSettlement.connect(buyer).settleInvoice(invoiceId, supplier.address, settleAmount)
      ).to.emit(b2bSettlement, "PaymentSettled");

      // Verify balances
      const buyerBalance = await mockUSDC.balanceOf(buyer.address);
      const supplierBalance = await mockUSDC.balanceOf(supplier.address);

      expect(buyerBalance).to.equal(ethers.parseUnits("750", decimals)); // 1000 - 250
      expect(supplierBalance).to.equal(settleAmount);

      // Verify state mapping
      const isSettled = await b2bSettlement.settledInvoices(invoiceId);
      expect(isSettled).to.be.true;
    });

    it("Should revert if the invoice ID is empty", async function () {
      const settleAmount = ethers.parseUnits("100", decimals);
      await expect(
        b2bSettlement.connect(buyer).settleInvoice("", supplier.address, settleAmount)
      ).to.be.revertedWith("Invoice ID cannot be empty");
    });

    it("Should revert if the supplier address is the zero address", async function () {
      const settleAmount = ethers.parseUnits("100", decimals);
      await expect(
        b2bSettlement.connect(buyer).settleInvoice("INV-TEST-002", ethers.ZeroAddress, settleAmount)
      ).to.be.revertedWith("Invalid supplier address");
    });

    it("Should revert if the amount is zero", async function () {
      await expect(
        b2bSettlement.connect(buyer).settleInvoice("INV-TEST-003", supplier.address, 0)
      ).to.be.revertedWith("Amount must be greater than zero");
    });

    it("Should prevent double-settlement of the same invoice ID", async function () {
      const settleAmount = ethers.parseUnits("100", decimals);
      const invoiceId = "INV-DOUBLE-PREVENTION";

      await mockUSDC.connect(buyer).approve(await b2bSettlement.getAddress(), settleAmount * 2n);

      // First settlement succeeds
      await b2bSettlement.connect(buyer).settleInvoice(invoiceId, supplier.address, settleAmount);

      // Second settlement with same invoice ID must fail
      await expect(
        b2bSettlement.connect(buyer).settleInvoice(invoiceId, supplier.address, settleAmount)
      ).to.be.revertedWith("Invoice already settled");
    });
  });
});
