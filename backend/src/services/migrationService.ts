import { Project } from '../models/Project.js';
import { ClientPayment } from '../models/ClientPayment.js';
import { Payroll } from '../models/Payroll.js';
import { PayrollMilestone } from '../models/PayrollMilestone.js';
import { Expense } from '../models/Expense.js';

export class MigrationService {
  public static async runMigrations(): Promise<void> {
    try {
      console.log('🔄 Checking for multi-currency database migrations...');

      // 1. Migrate Projects
      const projectsToMigrate = await Project.find({
        $or: [
          { currency: { $exists: false } },
          { estimatedExchangeRate: { $exists: false } },
          { estimatedInrValue: { $exists: false } },
          { estimatedInrValue: 0, projectValue: { $gt: 0 } },
        ],
      });

      if (projectsToMigrate.length > 0) {
        console.log(`📦 Migrating ${projectsToMigrate.length} projects to multi-currency schema...`);
        for (const project of projectsToMigrate) {
          const currency = project.currency || 'USD';
          const rate = project.estimatedExchangeRate || (currency === 'INR' ? 1 : 88);
          const inrVal = currency === 'INR' ? project.projectValue : Math.round(project.projectValue * rate);

          project.currency = currency;
          project.estimatedExchangeRate = rate;
          project.estimatedInrValue = inrVal;
          await project.save();
        }
      }

      // 2. Migrate Client Payments
      const paymentsToMigrate = await ClientPayment.find({
        $or: [
          { currency: { $exists: false } },
          { exchangeRate: { $exists: false } },
          { inrAmount: { $exists: false } },
          { inrAmount: 0, amount: { $gt: 0 } },
        ],
      }).populate('project', 'currency estimatedExchangeRate');

      if (paymentsToMigrate.length > 0) {
        console.log(`💵 Migrating ${paymentsToMigrate.length} client payments to multi-currency schema...`);
        for (const payment of paymentsToMigrate) {
          const projectCurrency = (payment.project as any)?.currency || 'USD';
          const currency = payment.currency || projectCurrency;
          const rate = payment.exchangeRate || (currency === 'INR' ? 1 : 88);
          const inrAmount = currency === 'INR' ? payment.amount : Math.round(payment.amount * rate * 100) / 100;

          payment.currency = currency;
          payment.exchangeRate = rate;
          payment.inrAmount = inrAmount;
          if (currency === 'USD' && !payment.exchangeRate) {
            payment.requiresExchangeRateUpdate = true;
          }
          await payment.save();
        }
      }

      // 3. Migrate Payrolls, Milestones, Expenses
      await Payroll.updateMany({ currency: { $exists: false } }, { $set: { currency: 'INR' } });
      await PayrollMilestone.updateMany({ currency: { $exists: false } }, { $set: { currency: 'INR' } });
      await Expense.updateMany({ currency: { $exists: false } }, { $set: { currency: 'INR' } });

      console.log('✅ Multi-currency database migration completed successfully.');
    } catch (error) {
      console.error('⚠️ Database migration check failed:', error);
    }
  }
}
