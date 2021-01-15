const { accounts } = require('@openzeppelin/test-environment');
const { contract } = require('./twrapper');

const { expectRevert, expectEvent, time, ether } = require('@openzeppelin/test-helpers');

const { expect } = require('chai');

const ImplV1 = contract.fromArtifact('DummyImplementation');
const ImplV2 = contract.fromArtifact('DummyImplementationV2');
const ProxyAdmin = contract.fromArtifact('EmiVotableProxyAdmin');
const EmiVoting = contract.fromArtifact('EmiVoting');
const MockUSDX = contract.fromArtifact('MockUSDX');
const Timelock = contract.fromArtifact('Timelock');
const TransparentUpgradeableProxy = contract.fromArtifact('TransparentUpgradeableProxy');

describe('ProxyAdmin', function () {
  const [proxyAdminOwner, newAdmin, anotherAccount] = accounts;

  before('set implementations', async function () {
    this.implementationV1 = await ImplV1.new();
    this.implementationV2 = await ImplV2.new();
  });

  beforeEach(async function () {
    const initializeData = Buffer.from('');
      this.usdx = await MockUSDX.new();
      this.usdx.transfer(newAdmin, ether('3000000'));
      this.timelock = await Timelock.new(proxyAdminOwner, 60*60*24*4);
      this.emiVote = await EmiVoting.new(this.timelock.address, this.usdx.address, proxyAdminOwner);

    this.proxyAdmin = await ProxyAdmin.new(this.emiVote.address, { from: proxyAdminOwner });
    this.proxy = await TransparentUpgradeableProxy.new(
      this.implementationV1.address,
      this.proxyAdmin.address,
      initializeData,
      { from: proxyAdminOwner },
    );
  });

  it('has an owner', async function () {
    expect(await this.proxyAdmin.owner()).to.equal(proxyAdminOwner);
  });

  describe('#getProxyAdmin', function () {
    it('returns proxyAdmin as admin of the proxy', async function () {
      const admin = await this.proxyAdmin.getProxyAdmin(this.proxy.address);
      expect(admin).to.be.equal(this.proxyAdmin.address);
    });
  });

  describe('#changeProxyAdmin', function () {
    it('fails to change proxy admin if its not the proxy owner', async function () {
      await expectRevert(
        this.proxyAdmin.changeProxyAdmin(this.proxy.address, newAdmin, { from: anotherAccount }),
        'caller is not the owner',
      );
    });

    it('changes proxy admin', async function () {
      await this.proxyAdmin.changeProxyAdmin(this.proxy.address, newAdmin, { from: proxyAdminOwner });
      expect(await this.proxy.admin.call({ from: newAdmin })).to.eq(newAdmin);
    });
  });

  describe('#getProxyImplementation', function () {
    it('returns proxy implementation address', async function () {
      const implementationAddress = await this.proxyAdmin.getProxyImplementation(this.proxy.address);
      expect(implementationAddress).to.be.equal(this.implementationV1.address);
    });
  });

  describe('#upgrade', function () {
    context('with unauthorized account', function () {
      it('fails to upgrade', async function () {
        await expectRevert(
          this.proxyAdmin.upgrade(this.proxy.address, this.implementationV2.address, { from: anotherAccount }),
          'caller is not the owner',
        );
      });
    });

    context('with authorized account', function () {
      it('upgrades implementation', async function () {
        r = await this.emiVote.propose([this.implementationV2.address],[0],['Signature'],['0x1111'],'Test proposal 2', 20);
        expectEvent.inLogs(r.logs,'ProposalCreated');
        let pid = r.logs[0].args.id;
        console.log('Block proposed 2: %d', await time.latestBlock());

	await time.advanceBlockTo(54); // skip some blocks
        await this.emiVote.castVote(pid, true, {from: newAdmin});
        await time.advanceBlockTo(94);

        await this.proxyAdmin.upgrade(this.proxy.address, pid, { from: proxyAdminOwner });
        const implementationAddress = await this.proxyAdmin.getProxyImplementation(this.proxy.address);
        expect(implementationAddress).to.be.equal(this.implementationV2.address);
      });
    });
  });
});