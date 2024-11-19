const axios = require('axios');
const { renderFile } = require('../../lib/mustache-render');
const laundromatBusiness = require('../../models/laundromatBusiness');
const { currency, formatDateWithTimezone } = require('../../lib/helpers');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');

/**
 * Send digestEmail to businessOnwer
 * @param {Object} businessOwnersData
 */
async function sendDigestEmailToBusinessOwner(mail) {
    try {
        const axiosInstance = axios.create({
            baseURL: 'https://api.sendgrid.com/v3',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.SEND_GRID_KEY}`,
            },
        });
        await axiosInstance.post('/mail/send', mail);
    } catch (err) {
        LoggerHandler('error', err);
        throw err;
    }
}

/**
 * Send Daily Digest email to all business owner
 * @param {Date} today
 * @param {Date} yesterday
 */
async function sendDailyDigestEmail(today, yesterday) {
    try {
        const queryPath = `${__dirname}/../../queries/reports/daily-digest-email-report.sql`;
        const dailyDigestquery = await renderFile(queryPath, {
            today,
            yesterday,
        });
        const response = await laundromatBusiness.knex().raw(dailyDigestquery);
        const personalizations = response.rows.map((row) => ({
            to: [
                {
                    email: row.email,
                },
            ],
            dynamic_template_data: {
                ...row,
                reportDate: formatDateWithTimezone(today),
                dashboardUrl: process.env.DASHBOARD_URL,
                ordersRevenue: currency(row.ordersRevenue),
                serviceOrdersTotalValue: currency(row.serviceOrdersTotalValue),
                inventoryOrdersTotalValue: currency(row.inventoryOrdersTotalValue),
            },
        }));

        if (personalizations && personalizations.length) {
            const mail = {
                personalizations,
                from: {
                    email: process.env.ADMIN_EMAIL,
                    name: 'Cents Admin',
                },
                template_id: process.env.DAILY_DIGEST_EMAIL_TEMPLATE,
            };
            const result = await sendDigestEmailToBusinessOwner(mail);
            LoggerHandler('info', result);
            return result;
        }
        LoggerHandler('info', 'No emails to send for today.');
        return true;
        // Completing the job
    } catch (err) {
        LoggerHandler('info', err);
        throw err;
    }
}

exports.sendDailyDigestEmail = sendDailyDigestEmail;
