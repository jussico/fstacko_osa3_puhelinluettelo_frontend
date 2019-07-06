import React, { useState, useEffect } from 'react'
import contactService from './services/contacts.js'

const Contact = ({ api, contact }) => {
    return (
        <div>
            {contact.name} {contact.number} <button name="deleteNappi" value={contact.id} onClick={api.deletoi}>delete</button>
        </div>
    )
}

const AllContacts = ({ api }) => {
    return (
        <>
            <h3>Numbers</h3>
            {
                api.filtered_contacts.map(contact => (
                    <Contact key={contact.name} api={api} contact={contact} />
                ))
            }
        </>
    )
}

const NewContact = ({ api }) => {
    return (
        <>
            <h3>add a new</h3>
            <form onSubmit={api.contact_lisays}>
                <div>name: <input name="uusiNimi" onChange={api.new_contact_name_change} value={api.uusi_nimi} /></div>
                <div>number: <input name="uusiNumero" onChange={api.new_contact_number_change} value={api.uusi_numero} /></div>
                <div><button type="submit">add</button></div>
            </form>
        </>
    )
}

const ContactFilter = ({ api }) => {
    return (
        <>
            <div>
                filter to show with <input autoFocus={true} name="filter" onChange={api.haku_muutos} value={api.search} type="search" />
            </div>
        </>
    )
}

const Notification = ({ message }) => {
    if (message === null) {
        return null
    }
    return (
        <div className="error">
            {message}
        </div>
    )
}

const GoodNotification = ({ message }) => {
    if (message === null) {
        return null
    }
    return (
        <div className="note">
            {message}
        </div>
    )
}

const App = () => {

    const [persons, setPersons] = useState([])
    const [hakuehto, setHakuehto] = useState('')
    const [filtered, setFiltered] = useState([])
    const [uusiNimi, setUusiNimi] = useState('')
    const [uusiNumero, setUusiNumero] = useState('')
    const [errorMessage, setErrorMessage] = useState(null)
    const [notificationMessage, setNotificationMessage] = useState(null)
    useEffect(() => {
        console.log('effectissä')
        contactService.getAll()
            .then(responseData => {
                console.log('promise fulfilled')
                setPersons(responseData)
                setFiltered(responseData)
            })
    }, [])
    console.log('render', persons.length, 'persons')

    const asetaHaku = (hakuNyt) => {
        setHakuehto(hakuNyt)
        setFiltered(persons.filter(person => (person.name.includes(hakuNyt))))
    }

    const hakuMuutos = ({ target: { value } }) => {
        asetaHaku(value)
    }

    const api = {
        contacts: persons,
        search: hakuehto,
        filtered_contacts: filtered,
        haku_muutos: hakuMuutos,
        contact_lisays: (jotain) => {
            jotain.preventDefault()
            const existingContact = persons.find(n => n.name === uusiNimi)
            const personObject = {
                name: uusiNimi,
                number: uusiNumero
            }
            if (existingContact === undefined) {
                contactService.create(personObject)
                    .then(responseData => {
                        console.log(responseData)
                        setNotificationMessage(`Added ${uusiNimi}`)
                        setTimeout(() => {
                            setNotificationMessage(null)
                        }, 5000)
                        // force filtering right away
                        contactService.getAll()
                            .then(responseData => {
                                console.log('promise fulfilled')
                                setPersons(responseData)
                                setFiltered(responseData.filter(person => (person.name.includes(hakuehto))))
                            })
                    })
            } else {
                const ok = window.confirm(`${uusiNimi} is already added to phonebook, replace the old number with a new one?`)
                if (ok) {
                    Object.assign(existingContact, personObject) // generic solution
                    contactService.update(existingContact.id, existingContact)
                        .then(responseData => {
                            console.log(responseData)
                            setNotificationMessage(`Modified ${uusiNimi} Phone number`)
                            setTimeout(() => {
                                setNotificationMessage(null)
                            }, 5000)
                            // force filtering right away
                            contactService.getAll()
                                .then(responseData => {
                                    console.log('promise fulfilled')
                                    setPersons(responseData)
                                    setFiltered(responseData.filter(person => (person.name.includes(hakuehto))))
                                })
                        })
                }
            }
        },
        uusi_nimi: uusiNimi,
        uusi_numero: uusiNumero,
        new_contact_name_change: e => {
            setUusiNimi(e.target.value)
        },
        new_contact_number_change: e => {
            setUusiNumero(e.target.value)
        },
        deletoi: ({ target: { value } }) => {
            const poistettava = persons.find(n => n.id === value)
            contactService.deletoi(value)
                .then(responseData => {
                    // force filtering right away
                    contactService.getAll()
                        .then(responseData => {
                            console.log('promise fulfilled')
                            setNotificationMessage(`${poistettava.name} Deleted.`)
                            setTimeout(() => {
                                setNotificationMessage(null)
                            }, 5000)
                            setPersons(responseData)
                            setFiltered(responseData.filter(person => (person.name.includes(hakuehto))))
                        })
                }).catch(error => {
                    contactService.getAll()
                        .then(responseData => {
                            console.log('promise fulfilled')
                            setPersons(responseData)
                            setFiltered(responseData)
                        })
                    setErrorMessage(
                        `Contact '${poistettava.name}' was already removed from server`
                    )
                    setTimeout(() => {
                        setErrorMessage(null)
                    }, 5000)
                })
        }
    }

    // throws bug here
    // setFiltered(persons.filter(person => (person.name.includes(hakuehto))))

    return (
        <div>
            <h2>Phonebook</h2>
            <Notification message={errorMessage} />
            <GoodNotification message={notificationMessage} />
            <ContactFilter api={api} />
            <NewContact api={api} />
            <AllContacts api={api} />
        </div>
    )

}

export default App
