import { expect } from 'chai'
import { Store } from '../../src/yayson'

describe('Store', function () {
  beforeEach(function () {
    this.store = new Store({
      types: {
        events: 'event',
        ticketBatches: 'ticketBatch',
        images: 'image',
        tickets: 'ticket',
        sponsors: 'sponsor',
        sponsorLevels: 'sponsorLevel',
        speakers: 'speaker',
        organisers: 'organiser',
        payments: 'payment',
      },
    })

    this.store.records = []
    return (this.store.relations = {})
  })

  it('should store an event', function () {
    this.store.sync({ event: { id: 1, name: 'Demo' } })
    const event = this.store.find('event', 1)
    expect(event.name).to.equal('Demo')
  })

  it('should populate relations', function () {
    this.store.sync({
      links: {
        'events.ticketBatches': { type: 'ticketBatches' },
        'events.images': { type: 'images' },
        'events.organisers': { type: 'organisers' },
        'organisers.image': { type: 'images' },
        'events.speakers': { type: 'speakers' },
        'speakers.image': { type: 'images' },
      },
    })

    expect(this.store.relations.event.images).to.equal('image')
    expect(this.store.relations.event.organisers).to.equal('organiser')
    expect(this.store.relations.event.speakers).to.equal('speaker')
    expect(this.store.relations.organiser.image).to.equal('image')
    expect(this.store.relations.speaker.image).to.equal('image')
  })

  it('should handle circular relations', function () {
    this.store.sync({
      links: {
        'event.images': { type: 'images' },
        'images.event': { type: 'event' },
      },
      event: { id: 1, name: 'Demo', images: [2] },
      images: [{ id: 2, event: 1 }],
    })
    const event = this.store.find('event', 1)
    expect(event.name).to.equal('Demo')
  })

  it('should return a event with all associated objects', function () {
    this.store.sync({
      links: {
        'events.ticketBatches': { type: 'ticketBatches' },
        'events.images': { type: 'images' },
        'events.organisers': { type: 'organisers' },
        'organisers.image': { type: 'images' },
        'events.speakers': { type: 'speakers' },
        'speakers.image': { type: 'images' },
      },
      ticketBatches: [
        { id: 1, name: 'Early bird', event: 1 },
        { id: 2, name: 'Regular', event: 1 },
      ],
      images: [
        { id: 1, type: 'logo', event: 1 },
        { id: 2, type: 'organise', event: 1 },
        { id: 3, type: 'organise', event: 1 },
        { id: 4, type: 'organiser', event: 1 },
        { id: 5, type: 'speaker', event: 1 },
      ],
      organisers: [
        { id: 3, firstName: 'Jonny', event: 1, image: 2 },
        { id: 2, firstName: 'Johannes', event: 1, image: 3 },
        { id: 1, firstName: 'Martina', event: 1, image: 4 },
      ],
      speakers: [{ id: 1, firstName: 'Ellen', event: 1, image: 5 }],
      event: {
        id: 1,
        name: 'Nordic.js',
        slug: 'nordicjs',
        ticketBatches: [1, 2],
        images: [1],
        organisers: [3, 2, 1],
        speakers: [1],
      },
    })

    const event = this.store.find('event', 1)
    expect(event.ticketBatches.length).to.equal(2)
    expect(event.organisers.length).to.equal(3)
    expect(event.speakers.length).to.equal(1)
    expect(event.speakers[0].image.id).to.equal(5)
  })

  it('should remove an event', function () {
    this.store.sync({
      events: [
        { id: 1, name: 'Demo' },
        { id: 2, name: 'Demo 2' },
      ],
    })

    this.store.remove('event', 1)
    const event = this.store.find('event', 1)
    expect(event).to.eq(null)
  })

  it('should remove all events', function () {
    this.store.sync({
      events: [
        { id: 1, name: 'Demo' },
        { id: 2, name: 'Demo 2' },
      ],
    })

    this.store.remove('event')
    const events = this.store.findAll('event')
    expect(events).to.deep.eq([])
  })

  return it('should reset', function () {
    this.store.sync({
      events: [
        { id: 1, name: 'Demo' },
        { id: 2, name: 'Demo 2' },
      ],
      images: [
        { id: 1, name: 'Image' },
        { id: 2, name: 'Image 2' },
      ],
    })

    this.store.reset()
    const events = this.store.findAll('event')
    const images = this.store.findAll('image')
    expect(events).to.deep.eq([])
    expect(images).to.deep.eq([])
  })
})
