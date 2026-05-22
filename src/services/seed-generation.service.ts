import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class SeedGenerationService {
    private _proxyUrl = 'https://z3r-proxy.derpaholicrex.workers.dev';

    constructor(private _http: HttpClient) {}

    getFormValues(): any {
        try {
            const form = document.querySelector('form.form-horizontal');
            if (!form) {
                console.warn('Form not found');
                return null;
            }

            const getRadioValue = (name: string) => {
                const radios = form.querySelectorAll('input[name="' + name + '"]:checked, label[name="' + name + '"].active');
                if (radios.length > 0) {
                    return (radios[0] as any).value || radios[0].getAttribute('btnradio');
                }
                return null;
            };

            const getSelectValue = (id: string) => {
                const select = form.querySelector('#' + id) as HTMLSelectElement;
                return select ? select.value : null;
            };

            return {
                itemPlacementSelected: getRadioValue('basic-place-button') || getRadioValue('advanced-place-button') || 'advanced',
                dungeonItemsSelected: getRadioValue('no-di-button') || getRadioValue('mc-button') || getRadioValue('mcs-button') || getRadioValue('keysanity-button') || 'standard',
                accessibilitySelected: getRadioValue('full-inv-button') || getRadioValue('full-loc-button') || getRadioValue('beatable-button') || 'items',
                goalSelected: getRadioValue('ganon-button') || getRadioValue('fast-ganon-button') || getRadioValue('alldungeons-button') || getRadioValue('pedestal-button') || 'triforce-button' || 'ganon',
                openTowerSelected: getSelectValue('open-tower-mode') || '7',
                openGanonSelected: getSelectValue('open-ganon-mode') || '7',
                modeSelected: getRadioValue('standard-button') || getRadioValue('open-button') || getRadioValue('inverted-button') || 'open',
                enemizerSelected: getRadioValue('no-enemy-button') || getRadioValue('simple-button') || getRadioValue('full-button') || getRadioValue('chaos-button') || 'none',
                hintsSelected: getRadioValue('with-hints-button') || getRadioValue('no-hints-button') || 'on',
                swordsSelected: getRadioValue('randomized-button') || getRadioValue('assured-button') || getRadioValue('swordless-button') || 'randomized'
            };
        } catch (error) {
            console.warn('Error reading form values:', error);
            return null;
        }
    }

    async generateNewSeed(formValues: any): Promise<any> {
        const fullUrl = this._proxyUrl + '/api/randomizer';
        const seedParams = {
            glitches: "none",
            item_placement: formValues && formValues.itemPlacementSelected ? formValues.itemPlacementSelected : "advanced",
            dungeon_items: formValues && formValues.dungeonItemsSelected ? formValues.dungeonItemsSelected : "standard",
            accessibility: formValues && formValues.accessibilitySelected ? formValues.accessibilitySelected : "items",
            goal: formValues && formValues.goalSelected ? formValues.goalSelected : "ganon",
            crystals: {
                ganon: formValues && formValues.openGanonSelected ? formValues.openGanonSelected : "7",
                tower: formValues && formValues.openTowerSelected ? formValues.openTowerSelected : "7"
            },
            mode: formValues && formValues.modeSelected ? formValues.modeSelected : "open",
            entrances: "none",
            hints: formValues && formValues.hintsSelected ? formValues.hintsSelected : "on",
            weapons: formValues && formValues.swordsSelected ? formValues.swordsSelected : "randomized",
            item: { pool: "normal", functionality: "normal" },
            tournament: false,
            spoilers: "on",
            lang: "en",
            enemizer: {
                boss_shuffle: formValues && formValues.enemizerSelected ? formValues.enemizerSelected : "none",
                enemy_shuffle: "none",
                enemy_damage: "default",
                enemy_health: "default"
            }
        };

        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(seedParams)
        });

        if (!response.ok) {
            if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please wait before trying again.');
            }
            throw new Error('HTTP ' + response.status + ': ' + response.statusText);
        }

        return await response.json();
    }

    async getSeed(type: 'open' | 'mystery', params: any = {}): Promise<any> {
        const fullUrl = this._proxyUrl + '/api/seed?type=' + type;
        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
        });

        if (!response.ok) {
            throw new Error('HTTP ' + response.status + ': ' + response.statusText);
        }

        return await response.json();
    }
}
